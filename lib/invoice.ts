// lib/invoice.ts (FIXED - WITH ABSOLUTE URL)
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
  try {
    // ✅ CRITICAL FIX: Use absolute URL for server-side calls
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const url = `${baseUrl}/api/create-invoice`;
    
    console.log('🔵 Invoice API URL:', url);
    console.log('🔵 Sending invoice request for order:', params.orderId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
          description: item.description,
          quantity: item.quantity,
          unit_price: item.price,
          vat_rate: 23,
        })),
        orderId: params.orderId,
        observations: `Online purchase - Order #${params.orderId}`,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Invoice created:', result.invoice.number);
      return {
        success: true,
        invoiceId: result.invoice.id,
        invoiceNumber: result.invoice.number,
        pdfUrl: result.invoice.pdf_url,
      };
    } else {
      console.error('❌ Invoice creation failed:', result.error);
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error('Error calling invoice API:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}