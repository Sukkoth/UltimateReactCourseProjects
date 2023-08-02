import { useEffect } from 'react';
export function useKey(key, action) {
    useEffect(() => {
        function eventCallBack(e) {
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        }
        document.addEventListener('keydown', eventCallBack);

        return () => {
            document.removeEventListener('keydown', eventCallBack);
        };
    }, [action, key]);
}
