import gsap from 'gsap';

console.log("HELLO")

const transformer = gsap.utils.pipe(
    gsap.utils.mapRange(20, 120, 0, 1),
    gsap.utils.clamp(0, 1),
    gsap.utils.interpolate(['#ffffffff', '#ffffffff', '#ffffffff', '#ffffff00'])
)
console.log(transformer(100))