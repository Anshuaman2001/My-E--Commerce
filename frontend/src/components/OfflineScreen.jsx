import { RefreshCw, WifiOff } from 'lucide-react'
import offlineVideo from '../assets/videos/offline.mp4'

const OfflineScreen = () => (
    <main className='fixed inset-0 z-[20000] grid min-h-[100dvh] place-items-center overflow-hidden bg-slate-950 p-4 text-center text-white sm:p-8'>
        <video
            className='absolute inset-0 h-full w-full object-cover opacity-40 sm:opacity-50'
            src={offlineVideo}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden='true'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/85' />

        <section className='relative z-10 w-full max-w-sm px-5 py-8 sm:max-w-lg sm:px-10 sm:py-11'>
            <div className='offline-reveal mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 sm:mb-6 sm:h-16 sm:w-16'>
                <WifiOff className='h-6 w-6 sm:h-8 sm:w-8' aria-hidden='true' />
            </div>
            <p className='offline-reveal mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 [animation-delay:120ms] sm:text-xs sm:tracking-[0.24em]'>You are offline</p>
            <h1 className='offline-title text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>Connection lost</h1>
            <p className='offline-reveal mx-auto mt-4 max-w-md text-sm leading-6 text-white/80 [animation-delay:220ms] sm:mt-5 sm:text-base sm:leading-7'>Check your internet connection and try again. We will bring you right back when you are online.</p>
            <button
                type='button'
                onClick={() => window.location.reload()}
                className='offline-reveal mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 [animation-delay:320ms] transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950 sm:mt-8 sm:w-auto sm:text-base'
            >
                <RefreshCw className='h-[18px] w-[18px]' aria-hidden='true' />
                Try again
            </button>
        </section>
    </main>
)

export default OfflineScreen
