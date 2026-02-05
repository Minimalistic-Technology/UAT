const API_URL = 'http://127.0.0.1:5000';

async function testAuth() {
    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        console.log('Login Status:', loginRes.status);

        if (loginRes.status !== 200) {
            const data = await loginRes.json();
            console.log('Login failed:', data);

            // Try registering if login failed
            if (loginRes.status === 400 && (data as any).msg === 'Invalid credentials') {
                console.log('User might not exist or wrong password. Trying to register...');
                const regRes = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })
                });
                console.log('Register Status:', regRes.status);
                if (regRes.status === 200) {
                    // Retry login
                    return testAuth();
                }
            }
            return;
        }

        const setCookie = loginRes.headers.get('set-cookie');
        console.log('Set-Cookie Header:', setCookie);

        if (!setCookie) {
            console.error('No cookie received!');
            return;
        }

        // Extract cookie
        const cookie = setCookie.split(';')[0];
        console.log('Extracted Cookie:', cookie);

        // 2. Get Me
        console.log('\nAttempting to get /me...');
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Cookie': cookie
            }
        });

        console.log('Get Me Status:', meRes.status);
        const meData = await meRes.json();
        console.log('User Data:', meData);

    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

testAuth();
