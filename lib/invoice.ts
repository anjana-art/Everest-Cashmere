// lib/invoice.ts - UPDATED WITH ABSOLUTE URL AND FIELD MAPPING

interface CreateInvoiceParams {
  client: {
    name: string;
    email: string;
    nif?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  };
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  orderId: string;
}

export async function createInvoiceAfterOrder(params: CreateInvoiceParams) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵🔵🔵 CREATE INVOICE AFTER ORDER STARTED 🔵🔵🔵');
  console.log('Order ID:', params.orderId);
  console.log('Client:', params.client.name, params.client.email);
  console.log('Items count:', params.items.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // ✅ FIXED: Use absolute URL with your production domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.himkash.com';
    const url = `${baseUrl}/api/create-invoice`;
    
    console.log('🔵 Invoice API URL:', url);
    console.log('🔵 Base URL from env:', process.env.NEXT_PUBLIC_APP_URL || 'using fallback');
    
    const requestBody = {
      client: {
        name: params.client.name,
        email: params.client.email,
        vat_number: params.client.nif,
        address: params.client.address,
        city: params.client.city,
        postal_code: params.client.postal_code,
      },
      items: params.items.map(item => ({
        name: item.name,
        description: item.description || item.name,
        quantity: item.quantity,
        unit_price: item.price,
        vat_rate: 23,
      })),
      orderId: params.orderId,
      observations: `Online purchase - Order #${params.orderId}`,
    };
    
    console.log('🔵 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔵 Response status:', response.status);
    
    const result = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵🔵🔵 RESPONSE FROM /api/create-invoice 🔵🔵🔵');
    console.log('Full response:', JSON.stringify(result, null, 2));
    console.log('Result.success:', result.success);
    console.log('Result.invoice:', result.invoice);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (result.success) {
      // ✅ Extract invoice data with correct field mapping
      const invoice = result.invoice || result.document || result;
      const invoiceId = invoice?.id;
      const invoiceNumber = invoice?.number || invoice?.sequence_number || `DRAFT-${invoiceId}`;
      const pdfUrl = invoice?.pdf_url || invoice?.permalink;
      
      console.log('✅✅✅ INVOICE CREATION SUCCESSFUL ✅✅✅');
      console.log('Extracted invoiceId:', invoiceId);
      console.log('Extracted invoiceNumber:', invoiceNumber);
      console.log('Extracted pdfUrl:', pdfUrl);
      
      return {
        success: true,
        invoiceId: invoiceId,
        invoiceNumber: invoiceNumber,
        pdfUrl: pdfUrl,
      };
    } else {
      console.error('❌❌❌ INVOICE CREATION FAILED ❌❌❌');
      console.error('Error:', result.error);
      console.error('Details:', result.details);
      return {
        success: false,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error) {
    console.error('❌❌❌ INVOICE API ERROR ❌❌❌');
    console.error('Error calling invoice API:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}