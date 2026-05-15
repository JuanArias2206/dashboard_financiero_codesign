import { useCallback, useEffect, useRef, useState } from 'react';

export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const mounted = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (!mounted.current) return;
        setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (!mounted.current) return;
        setState({ data: null, loading: false, error: e?.message || 'Error desconocido' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => { mounted.current = false; };
  }, [run]);

  return { ...state, reload: run };
}
