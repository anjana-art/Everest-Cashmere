// app/api/create-invoice/route.ts - ORIGINAL (NO NIF)

import { NextRequest, NextResponse } from 'next/server';

interface InvoiceClient {
  name: string;
  email: string;
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

    console.log('📋 REQUEST DETAILS:');
    console.log(`   Order ID: ${orderId || 'N/A'}`);
    console.log(`   Client Name: ${client.name}`);
    console.log(`   Client Email: ${client.email}`);
    console.log(`   Items Count: ${items.length}`);

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

    if (!apiKey || !account) {
      console.error('❌ MISSING CREDENTIALS');
      return NextResponse.json(
        { success: false, error: 'Invoice service not configured', timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    // ✅ FIND OR CREATE CLIENT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 CHECKING/ CREATING CLIENT IN INVOICEXPRESS...');
    
    let clientId: string | null = null;
    
    try {
      // Step 1: Search for existing client by email
      const searchUrl = `https://${account}/clients/search.json?api_key=${apiKey}&query=${encodeURIComponent(client.email)}`;
      console.log(`🔍 Searching for client: ${client.email}`);
      
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (searchData.clients && searchData.clients.length > 0) {
        clientId = searchData.clients[0].id;
        console.log(`✅ Found existing client! ID: ${clientId}`);
        console.log(`   Name: ${searchData.clients[0].name}`);
        console.log(`   Email: ${searchData.clients[0].email}`);
      } else {
        // Step 2: Create new client if not found
        console.log(`📝 Client not found. Creating new client...`);
        
        const createClientPayload = {
          client: {
            name: client.name.trim(),
            email: client.email.trim(),
            address: client.address?.trim() || '',
            city: client.city?.trim() || '',
            postal_code: client.postal_code?.trim() || '',
            phone: client.phone?.trim() || '',
          }
        };
        
        console.log('📦 Client Payload:', JSON.stringify(createClientPayload, null, 2));
        
        const createUrl = `https://${account}/clients.json?api_key=${apiKey}`;
        const createRes = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createClientPayload),
        });
        
        const createData = await createRes.json();
        
        if (createRes.ok && createData.client) {
          clientId = createData.client.id;
          console.log(`✅ New client created! ID: ${clientId}`);
          console.log(`   Name: ${createData.client.name}`);
          console.log(`   Email: ${createData.client.email}`);
        } else {
          console.error('❌ Failed to create client:', createData);
        }
      }
    } catch (clientError) {
      console.error('⚠️ Client operation error:', clientError);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const invoicePayload = buildInvoicePayload(client, items, orderId, observations);
    
    console.log('📦 INVOICE PAYLOAD:');
    console.log(JSON.stringify(invoicePayload, null, 2));

    const url = `https://${account}/invoices.json?api_key=${apiKey}`;
    
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
    console.log(`📡 Response Status: ${response.status}`);

    const data = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 INVOICEXPRESS API RESPONSE 🔵');
    console.log(`Status: ${response.status}`);
    console.log('Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!response.ok) {
      let errorMessage = formatApiError(data);
      
      if (errorMessage.includes('Client not found') && clientId) {
        console.log('🔄 Retrying invoice with client ID...');
        
        const retryPayload = buildInvoicePayload(client, items, orderId, observations);
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(retryPayload),
        });
        const retryData = await retryResponse.json();
        
        if (retryResponse.ok) {
          console.log('✅ Invoice created on retry!');
          return createSuccessResponse(retryData, startTime);
        }
      }
      
      console.error('❌ INVOICE ERROR:', errorMessage);
      
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

    return createSuccessResponse(data, startTime);

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ UNEXPECTED ERROR:', error.message);
    
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

function createSuccessResponse(data: any, startTime: number) {
  const invoiceData = data.invoice;
  const invoiceNumber = invoiceData.number || invoiceData.sequence_number || `DRAFT-${invoiceData.id}`;
  const pdfUrl = invoiceData.pdf_url || invoiceData.permalink;
  
  console.log('✅ INVOICE CREATED SUCCESSFULLY:');
  console.log(`   Invoice ID: ${invoiceData.id}`);
  console.log(`   Invoice Number: ${invoiceNumber}`);
  console.log(`   PDF URL: ${pdfUrl || 'Not available'}`);
  console.log(`   Total: ${invoiceData.total} EUR`);
  console.log(`⏱️ Total Time: ${Date.now() - startTime}ms`);

  return NextResponse.json({
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
  });
}

function validateRequest(client: InvoiceClient, items: InvoiceItem[]): string | null {
  if (!client.name || client.name.trim() === '') return 'Client name is required';
  if (!client.email || !isValidEmail(client.email)) return 'Valid client email is required';
  if (!items || items.length === 0) return 'At least one item is required';
  
  for (const item of items) {
    if (!item.name || item.name.trim() === '') return 'All items must have a name';
    if (item.quantity <= 0) return 'Item quantity must be greater than zero';
    if (item.unit_price <= 0) return 'Item price must be greater than zero';
  }
  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
            name:`IVA23`,
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
  if (orderId) observations.push(`Order ID: ${orderId}`);
  if (customObservations) observations.push(customObservations);
  observations.push('Taxa de IVA 23% incluída no preço.');
  observations.push('Thank you for shopping with us!');
  return observations.join(' | ');
}

function formatApiError(errorData: any): string {
  if (errorData?.errors) {
    if (Array.isArray(errorData.errors)) {
      const errors = errorData.errors;
      
      const rateLimitError = errors.find((e: any) => 
        e.error?.includes('limite de criação') || e.error?.includes('document limit')
      );
      if (rateLimitError) return 'Invoice limit reached. Please upgrade your plan or try again next month.';
      
      const clientError = errors.find((e: any) => 
        e.error?.includes('Cliente não é válido')
      );
      if (clientError) return 'Client not found in InvoiceXpress. Client will be created automatically on next attempt.';
      
      return errors[0]?.error || 'Invoice creation failed';
    }
  }
  
  if (errorData?.message) return errorData.message;
  return 'Failed to create invoice. Please try again.';
}