const carModels = [
  'suzuki swift.glb',
  'vw golf gti.glb',
  'peugeot 206.glb',
  'toyota hilux.glb',
  'toyota fortuner.glb',
  'taxi.glb',
];
const xlanes = [-6, -3, 3, -6]; 
// const speed = [0.2, 0.4, 0.6, 0.8]
let previousXlane = null;

export default function Cars() {
    const availableXlanes = xlanes.filter(x => x !== previousXlane);
    const newXlane = availableXlanes[Math.floor(Math.random() * availableXlanes.length)];
    previousXlane = newXlane;

    const car = {
      id: `${Date.now()}-${Math.random()}`,
      model: carModels[Math.floor(Math.random() * carModels.length)],
      x: newXlane, 
      z: -100, 
      // speed: speed[Math.floor(Math.random() * speed.length)],
    }

    console.log(car); 
    return car; 
}