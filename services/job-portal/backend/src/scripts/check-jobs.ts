import axios from 'axios';

const run = async () => {
    try {
        const res = await axios.get("http://localhost:5000/api/jobs");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
        console.error(e.message);
    }
}
run();
