// MetaMask's extension injects an `inpage.js` into every page that bundles
// their SDK's ChromeTransport. When MV3's background service worker is asleep,
// the transport throws `TransportError("Failed to connect to MetaMask", ...)`
// as an unhandled promise rejection. In dev, webpack-dev-server's error
// listener catches it and pops the fullscreen overlay — even though nothing
// in our app touched MetaMask.
//
// We install a capture-phase listener that swallows ONLY rejections whose
// reason matches that exact MetaMask SDK shape. Anything else passes through
// to the overlay normally, so real bugs are not hidden.

const looksLikeMetamaskNoise = (reason) => {
  if (!reason) return false;
  const msg = typeof reason === 'string' ? reason : reason.message;
  if (typeof msg !== 'string') return false;
  if (
    msg.includes('Failed to connect to MetaMask')
    || msg.includes('MetaMask extension not found')
    || msg.includes('No extension found with id:')
  ) return true;
  const stack = typeof reason.stack === 'string' ? reason.stack : '';
  return stack.includes('inpage.js') && stack.toLowerCase().includes('metamask');
};

const onRejection = (event) => {
  if (looksLikeMetamaskNoise(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const onError = (event) => {
  // Some browsers surface the same noise as a window error too.
  if (looksLikeMetamaskNoise(event.error || event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', onRejection, true);
  window.addEventListener('error', onError, true);
}
