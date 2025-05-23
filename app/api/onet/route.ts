import { NextRequest, NextResponse } from 'next/server';

const ONET_BASE_URL = 'https://services.onetcenter.org/ws/';
const CLIENT_PARAM = 'careerquest_unlockin';
const USERNAME = 'careerquest_unlockin';
const PASSWORD = '5392zeb';

// Create a base64 encoded auth string
const authString = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function GET(request: NextRequest) {
  try {
    // Get the path parameter from the query string
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }
    
    // Copy all query parameters except 'path'
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        queryParams.append(key, value);
      }
    });
    
    // Add the client parameter if not already present
    if (!queryParams.has('client')) {
      queryParams.append('client', CLIENT_PARAM);
    }
    
    // Construct the URL to the O*NET API
    const url = `${ONET_BASE_URL}${path}?${queryParams.toString()}`;
    
    console.log('Proxying request to:', url);
    
    // Make the request to O*NET with Basic Authentication
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CareerQuest/1.0',
        'Authorization': `Basic ${authString}`
      },
    });
    
    // Check if the response is ok
    if (!response.ok) {
      console.error('O*NET API Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return NextResponse.json(
        { error: `O*NET API returned error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response from O*NET
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error proxying request to O*NET:', error);
    return NextResponse.json(
      { error: `Failed to fetch data from O*NET Web Services: ${error.message}` },
      { status: 500 }
    );
  }
}
