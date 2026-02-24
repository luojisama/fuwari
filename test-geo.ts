
import { getCityCoordinates } from './src/utils/geocoding';

async function test() {
    console.log("Testing geocoding for Chengdu...");
    const result = await getCityCoordinates("成都");
    console.log("Result:", result);

    console.log("Testing geocoding for Chongqing...");
    const result2 = await getCityCoordinates("重庆");
    console.log("Result:", result2);
}

test();
