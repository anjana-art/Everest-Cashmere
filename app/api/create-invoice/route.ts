import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPES
// ============================================

interface InvoiceClient {
  name: string;
  email: string;
  vat_number?: string;      // NIF (optional for B2C customers)
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
}

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  vat_rate?: number;        // Defaults to 23% for clothing
}

interface CreateInvoiceRequest {
  client: InvoiceClient;
  items: InvoiceItem[];
  orderId?: string;         // Your internal order ID
  observations?: string;
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body: CreateInvoiceRequest = await request.json();
    const { client, items, orderId, observations } = body;

    // 2. Validate required fields
    const validationError = validateRequest(client, items);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // 3. Get environment variables
    const apiKey = process.env.INVOICEXPRESS_API_KEY;
    const account = process.env.INVOICEXPRESS_ACCOUNT;

    if (!apiKey || !account) {
      console.error('Missing InvoiceXpress credentials');
      return NextResponse.json(
        { success: false, error: 'Invoice service not configured' },
        { status: 500 }
      );
    }

    // 4. Build the invoice payload
    const invoicePayload = buildInvoicePayload(client, items, orderId, observations);

    // 5. Call InvoiceXpress API
    const response = await fetch(
      `https://${account}/invoices.json?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      }
    );

    const data = await response.json();

    // 6. Handle API errors
    if (!response.ok) {
      console.error('InvoiceXpress API Error:', {
        status: response.status,
        error: data
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: formatApiError(data),
          details: data 
        },
        { status: response.status }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      invoice: {
        id: data.invoice?.id,
        number: data.invoice?.number,
        status: data.invoice?.status,
        date: data.invoice?.date,
        due_date: data.invoice?.due_date,
        subtotal: data.invoice?.subtotal,
        tax: data.invoice?.tax,
        total: data.invoice?.total,
        pdf_url: data.invoice?.pdf_url,
        invoice_url: `/invoice/${data.invoice?.id}`,
      },
    });

  } catch (error) {
    console.error('Unexpected error creating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function validateRequest(client: InvoiceClient, items: InvoiceItem[]): string | null {
  if (!client.name || client.name.trim() === '') {
    return 'Client name is required';
  }
  
  if (!client.email || !isValidEmail(client.email)) {
    return 'Valid client email is required';
  }
  
  if (!items || items.length === 0) {
    return 'At least one item is required';
  }
  
  for (const item of items) {
    if (!item.name || item.name.trim() === '') {
      return 'All items must have a name';
    }
    if (item.quantity <= 0) {
      return 'Item quantity must be greater than zero';
    }
    if (item.unit_price <= 0) {
      return 'Item price must be greater than zero';
    }
  }
  
  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function buildInvoicePayload(
  client: InvoiceClient, 
  items: InvoiceItem[], 
  orderId?: string, 
  observations?: string
) {
  // Format dates for Portuguese format (dd/mm/yyyy)
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 7); // 7 days due date
  
  return {
    invoice: {
      date: formatDateToPortuguese(today),
      due_date: formatDateToPortuguese(dueDate),
      client: {
        name: client.name.trim(),
        email: client.email.trim(),
        fiscal_id: client.vat_number?.trim() || '',     // NIF - optional
        address: client.address?.trim() || '',
        city: client.city?.trim() || '',
        postal_code: client.postal_code?.trim() || '',
        phone: client.phone?.trim() || '',
      },
      items: items.map(item => ({
        name: item.name.trim(),
        description: item.description?.trim() || item.name.trim(),
        quantity: item.quantity,
        unit_price: Number(item.unit_price).toFixed(2),
        tax: {
          name: `IVA ${item.vat_rate || 23}%`,
        },
      })),
      observations: buildObservations(orderId, observations),
    },
  };
}

function formatDateToPortuguese(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function buildObservations(orderId?: string, customObservations?: string): string {
  const observations = [];
  
  if (orderId) {
    observations.push(`Order ID: ${orderId}`);
  }
  
  if (customObservations) {
    observations.push(customObservations);
  }
  
  observations.push('Thank you for shopping with us!');
  
  return observations.join(' | ');
}

function formatApiError(errorData: any): string {
  // Common InvoiceXpress error messages
  if (errorData?.errors) {
    const errors = errorData.errors;
    if (errors.client_name) return 'Client name is invalid';
    if (errors.client_email) return 'Client email is invalid';
    if (errors.items) return 'Items are invalid';
    if (errors.tax) return 'VAT rate is not configured. Check your tax settings.';
  }
  
  if (errorData?.message) {
    if (errorData.message.includes('sequence')) {
      return 'Invoice sequence not configured. Please contact support.';
    }
    if (errorData.message.includes('tax')) {
      return 'VAT rate not found. Please check your tax settings in InvoiceXpress.';
    }
    return errorData.message;
  }
  
  return 'Failed to create invoice. Please try again.';
}