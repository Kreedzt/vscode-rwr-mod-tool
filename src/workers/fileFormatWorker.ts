import { parentPort } from 'worker_threads';
import { formatXml } from '../utils/file';

parentPort?.on('message', async (message) => {
    console.log('Worker:: on message', message.type, `data length: ${message.data.length}`);
    switch (message.type) {
        case 'formatXml': {
            try {
                const resData = await formatXml(message.data);

                console.log('Worker:: success formatXml', resData.length);

                parentPort?.postMessage({
                    type: 'success',
                    data: resData,
                    id: message.id
                });
            } catch (e) {
                console.log('Worker:: failed formatXml');
                parentPort?.postMessage({
                    type: 'error',
                    data: e,
                    id: message.id
                });
            }
            break;
        }
        case 'exit': {
            // clean up
            process.exit(0);
        }
        default:
            break;
    }
});