// app/api/create-invoice/route.ts - ENHANCED WITH BETTER LOGGING

import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 CREATE-INVOICE API CALLED');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const body: CreateInvoiceRequest = await request.json();
    const { client, items, orderId, observations } = body;

    // Detailed request logging
    console.log('📋 REQUEST DETAILS:');
    console.log(`   Order ID: ${orderId || 'N/A'}`);
    console.log(`   Client Name: ${client.name}`);
    console.log(`   Client Email: ${client.email}`);
    console.log(`   Client NIF: ${client.vat_number || 'Not provided'}`);
    console.log(`   Items Count: ${items.length}`);
    console.log(`   Items: ${JSON.stringify(items.map(i => ({ name: i.name, qty: i.quantity, price: i.unit_price })))}`);
    
    // Validation
    const validationError = validateRequest(client, items);
    if (validationError) {
      console.error('❌ VALIDATION ERROR:', validationError);
      return NextResponse.json(
        { success: false, error: validationError, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const apiKey = process.env.INVOICEXPRESS_API_KEY;
    const account = process.env.INVOICEXPRESS_ACCOUNT;

    console.log('🔑 INVOICEXPRESS CONFIG:');
    console.log(`   Account: ${account}`);
    console.log(`   API Key: ${apiKey ? '✓ Present' : '✗ Missing'}`);
    console.log(`   API Key Length: ${apiKey?.length || 0}`);

    if (!apiKey || !account) {
      console.error('❌ MISSING CREDENTIALS: API Key or Account missing');
      return NextResponse.json(
        { success: false, error: 'Invoice service not configured', timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    const invoicePayload = buildInvoicePayload(client, items, orderId, observations);
    
    console.log('📦 INVOICE PAYLOAD:');
    console.log(JSON.stringify(invoicePayload, null, 2));

    const url = `https://${account}/invoices.json?api_key=${apiKey}`;
    console.log(`🌐 API URL: ${url.replace(apiKey, 'HIDDEN')}`);
    
    const apiStartTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });
    const apiDuration = Date.now() - apiStartTime;

    console.log(`⏱️ API Response Time: ${apiDuration}ms`);
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵🔵🔵 INVOICEXPRESS API RESPONSE 🔵🔵🔵');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok ? '✅' : '❌'}`);
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!response.ok) {
      // Enhanced error logging
      console.error('❌ INVOICEXPRESS API ERROR:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Status Text: ${response.statusText}`);
      
      if (data.errors) {
        console.error('   Error Details:');
        if (Array.isArray(data.errors)) {
          data.errors.forEach((err: any, idx: number) => {
            console.error(`      ${idx + 1}. ${err.error}`);
          });
        } else {
          console.error(`      ${JSON.stringify(data.errors)}`);
        }
      }
      
      const errorMessage = formatApiError(data);
      console.error(`   Formatted Error: ${errorMessage}`);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: data,
          timestamp: new Date().toISOString()
        },
        { status: response.status }
      );
    }

    const invoiceData = data.invoice;
    const invoiceNumber = invoiceData.number || invoiceData.sequence_number || `DRAFT-${invoiceData.id}`;
    const pdfUrl = invoiceData.pdf_url || invoiceData.permalink;
    
    console.log('✅ INVOICE CREATED SUCCESSFULLY:');
    console.log(`   Invoice ID: ${invoiceData.id}`);
    console.log(`   Invoice Number: ${invoiceNumber}`);
    console.log(`   Status: ${invoiceData.status}`);
    console.log(`   PDF URL: ${pdfUrl || 'Not available'}`);
    console.log(`   Total: ${invoiceData.total} ${invoiceData.currency || 'EUR'}`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`⏱️ Total Request Time: ${totalDuration}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ UNEXPECTED ERROR:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error(`   Duration: ${totalDuration}ms`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

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
  
  const calculateBasePrice = (priceWithVat: number, vatRate: number = 23): number => {
    return priceWithVat / (1 + vatRate / 100);
  };
  
  return {
    invoice: {
      type: "Invoice",
      status: "rascunho",
      date: formatDateToPortuguese(today),
      due_date: formatDateToPortuguese(dueDate),
      
      client: {
        name: client.name.trim(),
        email: client.email.trim(),
        fiscal_id: client.vat_number?.trim() || '999999990',
        address: client.address?.trim() || '',
        city: client.city?.trim() || '',
        postal_code: client.postal_code?.trim() || '',
        phone: client.phone?.trim() || '',
      },
      
      items: items.map(item => {
        const vatRate = item.vat_rate || 23;
        const basePrice = calculateBasePrice(item.unit_price, vatRate);
        
        return {
          name: item.name.trim(),
          description: item.description?.trim() || item.name.trim(),
          quantity: item.quantity,
          unit_price: Number(basePrice).toFixed(4),
          tax: {
            name: `IVA ${vatRate}%`,
            value: vatRate,
          },
        };
      }),
      
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
  
  observations.push('Taxa de IVA 23% incluída no preço.');
  observations.push('Thank you for shopping with us!');
  
  return observations.join(' | ');
}

function formatApiError(errorData: any): string {
  if (errorData?.errors) {
    if (Array.isArray(errorData.errors)) {
      const errors = errorData.errors;
      
      // Check for rate limit error
      const rateLimitError = errors.find((e: any) => 
        e.error?.includes('limite de criação') || 
        e.error?.includes('document limit')
      );
      if (rateLimitError) {
        return 'Invoice limit reached. Please upgrade your plan or try again next month.';
      }
      
      // Check for client errors
      const clientError = errors.find((e: any) => 
        e.error?.includes('Cliente não é válido')
      );
      if (clientError) {
        return 'Client not found in InvoiceXpress. Please create the client first.';
      }
      
      // Check for fiscal ID errors
      const fiscalError = errors.find((e: any) => 
        e.error?.includes('Fiscal não é válido')
      );
      if (fiscalError) {
        return 'Invalid NIF/Fiscal ID. Please check the tax number.';
      }
      
      // Return first error
      return errors[0]?.error || 'Invoice creation failed';
    }
    
    if (errorData.errors.client_name) return 'Client name is invalid';
    if (errorData.errors.client_email) return 'Client email is invalid';
    if (errorData.errors.items) return 'Items are invalid';
    if (errorData.errors.tax) return 'VAT rate is not configured. Check your tax settings.';
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