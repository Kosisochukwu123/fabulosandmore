import useLocalStorage from './useLocalStorage';
import toast from 'react-hot-toast';

export default function useWishlist() {
  const [wishlist, setWishlist] = useLocalStorage('fab_wishlist', []);

  const toggle = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        toast('Removed from wishlist', { icon: '🗑️' });
        return prev.filter(p => p._id !== product._id);
      }
      toast.success('Added to wishlist!');
      return [...prev, { _id: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url }];
    });
  };

  const isWishlisted = (id) => wishlist.some(p => p._id === id);

  return { wishlist, toggle, isWishlisted };
}