import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPES
// ============================================

interface InvoiceClient {
  name: string;
  email: string;
  vat_number?: string;
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
  vat_rate?: number;
}

interface CreateInvoiceRequest {
  client: InvoiceClient;
  items: InvoiceItem[];
  orderId?: string;
  observations?: string;
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 CREATE-INVOICE API CALLED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const body: CreateInvoiceRequest = await request.json();
    const { client, items, orderId, observations } = body;

    console.log('📋 Request body:', {
      orderId,
      clientName: client.name,
      clientEmail: client.email,
      itemsCount: items.length,
    });

    const validationError = validateRequest(client, items);
    if (validationError) {
      console.error('❌ Validation error:', validationError);
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const apiKey = process.env.INVOICEXPRESS_API_KEY;
    const account = process.env.INVOICEXPRESS_ACCOUNT;

    console.log('🔑 InvoiceXpress config:', {
      hasApiKey: !!apiKey,
      account: account,
    });

    if (!apiKey || !account) {
      console.error('❌ Missing InvoiceXpress credentials');
      return NextResponse.json(
        { success: false, error: 'Invoice service not configured' },
        { status: 500 }
      );
    }

    const invoicePayload = buildInvoicePayload(client, items, orderId, observations);
    console.log('📦 Invoice payload built successfully');

    const url = `https://${account}/invoices.json?api_key=${apiKey}`;
    console.log(`🌐 Calling InvoiceXpress API: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const data = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵🔵🔵 RAW INVOICEXPRESS RESPONSE 🔵🔵🔵');
    console.log('Status code:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!response.ok) {
      console.error('❌ InvoiceXpress API Error:', {
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

    console.log('🔵 Response contains invoice?', !!data.invoice);
    console.log('🔵 Response keys:', Object.keys(data));
    
    if (data.invoice) {
      console.log('🔵 Invoice data:', {
        id: data.invoice.id,
        number: data.invoice.number,
        sequence_number: data.invoice.sequence_number,
        permalink: data.invoice.permalink,
      });
    }

    // ✅ FIXED: Map InvoiceXpress fields correctly
    const invoiceData = data.invoice;
    const invoiceNumber = invoiceData.number || invoiceData.sequence_number || `DRAFT-${invoiceData.id}`;
    const pdfUrl = invoiceData.pdf_url || invoiceData.permalink;
    
    console.log('✅ Mapped invoice data:', {
      id: invoiceData.id,
      number: invoiceNumber,
      pdfUrl: pdfUrl,
    });

    const responseData = {
      success: true,
      invoice: {
        id: invoiceData.id,
        number: invoiceNumber,
        status: invoiceData.status,
        date: invoiceData.date,
        due_date: invoiceData.due_date,
        subtotal: invoiceData.before_taxes,
        tax: invoiceData.taxes,
        total: invoiceData.total,
        pdf_url: pdfUrl,
        invoice_url: `/invoice/${invoiceData.id}`,
      },
    };
    
    console.log('✅ Invoice created successfully:', {
      invoiceId: responseData.invoice.id,
      invoiceNumber: responseData.invoice.number,
      pdfUrl: responseData.invoice.pdf_url,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Unexpected error creating invoice:', error);
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
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 7);
  
  return {
    invoice: {
      date: formatDateToPortuguese(today),
      due_date: formatDateToPortuguese(dueDate),
      client: {
        name: client.name.trim(),
        email: client.email.trim(),
        fiscal_id: client.vat_number?.trim() || '',
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