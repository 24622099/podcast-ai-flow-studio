import { useToast } from "@/hooks/use-toast";

export const handleApiCall = async (url: string, payload: any, successMessage: string) => {
  const { toast } = useToast();
  
  try {
    console.log(`Making API call to: ${url}`, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    console.log('API Response:', data);

    // Special handling for specific endpoints
    // For RunPromt endpoint, we want to keep the array structure intact
    if (url.includes('RunPromt')) {
      console.log('Preserving array structure for RunPromt endpoint', data);
      // If data is not an array but contains data property that is an array, extract it
      if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
        console.log('Extracting data array from response object');
        data = data.data;
      }
    } 
    // For other endpoints, handle arrays by taking the first item if needed
    else if (Array.isArray(data) && data.length > 0) {
      console.log('Processing non-RunPromt endpoint, taking first item from array');
      data = data[0];
    }

    if (data.status === 'error') {
      throw new Error(data.message || 'Unknown error occurred');
    }

    toast({
      title: "Success",
      description: data.message || successMessage,
    });

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to communicate with server',
      variant: "destructive",
    });
    throw error;
  }
};
