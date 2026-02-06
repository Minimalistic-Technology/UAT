
import http from 'http';

function post(path: string, body: any): Promise<{ status: number, data: any, headers: any }> {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/auth' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = http.request(options, (res) => {
            let chunk = '';
            res.on('data', (d) => chunk += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(chunk);
                    resolve({ status: res.statusCode || 0, data: json, headers: res.headers });
                } catch (e) {
                    console.error('Do not parse JSON:', chunk);
                    resolve({ status: res.statusCode || 0, data: chunk, headers: res.headers });
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function test() {
    console.log('Starting verification (HTTP)...');

    const timestamp = Date.now();
    const userEmail = `user${timestamp}@test.com`;
    const adminEmail = `admin${timestamp}@test.com`;

    try {
        // 1. Register User
        console.log(`\n1. Registering User: ${userEmail}`);
        const resUser = await post('/register', { name: 'Test User', email: userEmail, password: 'password' });

        if (resUser.status !== 200) {
            console.error('User registration failed:', resUser.data);
            process.exit(1);
        }
        if (resUser.data.user.role !== 'user') {
            console.error('FAIL: Expected role "user", got:', resUser.data.user.role);
            process.exit(1);
        }
        console.log('SUCCESS: User registered with role "user"');

        // 2. Register Admin
        console.log(`\n2. Registering Admin: ${adminEmail}`);
        const resAdmin = await post('/register', { name: 'Admin User', email: adminEmail, password: 'password', role: 'admin' });

        if (resAdmin.status !== 200) {
            console.error('Admin registration failed:', resAdmin.data);
            process.exit(1);
        }
        if (resAdmin.data.user.role !== 'admin') {
            console.error('FAIL: Expected role "admin", got:', resAdmin.data.user.role);
            process.exit(1);
        }
        console.log('SUCCESS: Admin registered with role "admin"');

        // 3. Login Admin
        console.log(`\n3. Logging in as Admin...`);
        const resLogin = await post('/login', { email: adminEmail, password: 'password' });

        if (resLogin.status !== 200) {
            console.error('Login failed:', resLogin.data);
            process.exit(1);
        }
        if (resLogin.data.user.role !== 'admin') {
            console.error('FAIL: Login response missing correct role:', resLogin.data.user.role);
            process.exit(1);
        }
        console.log('SUCCESS: Login returned correct role');

        // 4. Verify Cookie
        const setCookie = resLogin.headers['set-cookie'];
        if (!setCookie) {
            console.warn('WARNING: Set-Cookie header missing');
        } else {
            console.log('SUCCESS: Cookie set', setCookie);
        }

        console.log('\nALL TESTS PASSED');
        process.exit(0);

    } catch (err) {
        console.error('Test execution error:', err);
        process.exit(1);
    }
}

test();
