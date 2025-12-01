import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';

function App() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Carregando...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
