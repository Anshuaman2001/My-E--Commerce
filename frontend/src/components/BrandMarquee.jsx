import React from 'react'

const BrandMarquee = () => {
    const brands = [
        'ZARA', 'H&M', 'PRADA', 'GUCCI', 'NIKE', 'ADIDAS', 'CHANEL', 
        'LV', 'VERSACE', 'DIOR', 'HERMES', 'PUMA', 'ROLEX', 'ARMANI'
    ];

    const displayBrands = [...brands, ...brands, ...brands];

    return (
        <div className="relative w-full bg-transparent py-6 mt-2 mb-8 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center">
                {displayBrands.map((brand, index) => (
                    <React.Fragment key={index}>
                        <span 
                            className="text-[#ff4f00] text-xl md:text-2xl font-bold mx-10 md:mx-16 tracking-[0.2em] hover:scale-110 transition-all duration-500 cursor-default prata-regular uppercase opacity-70 hover:opacity-100"
                        >
                            {brand}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f00]/20 mx-3"></span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default BrandMarquee
