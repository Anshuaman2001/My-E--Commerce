import { useContext } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import hero_img from '../assets/hero_img.png'
import Magnet from './Magnet'
import { ChevronDown } from 'lucide-react'

const Hero = () => {
    const { products, currency } = useContext(ShopContext);

    // Filter a few products for the hotspots
    const hotspotProducts = [
        { id: "aaaaa", top: "25%", left: "40%" },
        { id: "aaaab", top: "65%", left: "70%" }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className='relative flex flex-col sm:flex-row min-h-[75vh] items-center'
        >
            {/* Hero left side*/}
            <div className='w-full sm:w-1/2 flex items-center justify-center py-20 sm:py-0'>
                <motion.div variants={itemVariants} className='text-[#414141]'>
                    <div className='flex items-center gap-2 mb-3'>
                        <motion.p 
                            initial={{ width: 0 }}
                            animate={{ width: 44 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className='h-[2px] bg-[#414141]'
                        ></motion.p>
                        <p className='font-medium text-sm md:text-base tracking-[0.2em]'>OUR BESTSELLERS</p>
                    </div>
                    <h1 className='prata-regular text-4xl lg:text-6xl leading-tight text-[#414141] mb-6'>
                        Latest <br /> Arrivals
                    </h1>
                    <div className='flex items-center gap-2'>
                        <Magnet strength={0.2}>
                            <p className='font-semibold text-sm md:text-base cursor-pointer hover:text-[#ff4f00] transition-colors'>SHOP NOW</p>
                        </Magnet>
                        <motion.p 
                            initial={{ width: 0 }}
                            animate={{ width: 44 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className='h-[1.5px] bg-[#414141]'
                        ></motion.p>
                    </div>
                </motion.div>
            </div>

            {/* Hero Right Side (Image Area with Hotspots) */}
            <motion.div 
                variants={itemVariants}
                className='w-full sm:w-1/2 relative group overflow-hidden h-[45vh] sm:h-[75vh]'
            >
                <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="w-full h-full object-cover" 
                    src={hero_img} 
                    alt="Hero" 
                />
                
                {hotspotProducts.map((spot, index) => {
                    const product = products.find(p => p._id === spot.id);
                    if (!product) return null;

                    return (
                        <div 
                            key={index} 
                            className="absolute z-20" 
                            style={{ top: spot.top, left: spot.left }}
                        >
                            <div className="relative group/spot">
                                {/* Pulsing Dot */}
                                <motion.div 
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-4 h-4 bg-white rounded-full absolute -inset-1"
                                />
                                <div className="w-2 h-2 bg-black rounded-full relative z-10 cursor-pointer" />

                                {/* Preview Card */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/spot:opacity-100 transition-all duration-300 pointer-events-none group-hover/spot:pointer-events-auto">
                                    <Link to={`/product/${product._id}`} className="block w-40 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-white/20">
                                        <img src={product.image[0]} className="w-full aspect-square object-cover rounded-lg mb-2" alt="" />
                                        <p className="text-[11px] font-bold text-gray-800 line-clamp-1">{product.name}</p>
                                        <p className="text-[12px] font-medium text-[#ff4f00]">{currency}{product.price}</p>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-xl"></div>
                                    </Link>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/95 mx-auto" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    delay: 2, 
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
            >
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
                <ChevronDown size={16} />
            </motion.div>
        </motion.div>
    )
}

export default Hero