import { Layout } from "./shared/components/Layout";

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p>
          Bem-vindo ao sistema de gestão de oficinas mecânicas. Selecione um
          módulo no menu lateral.
        </p>
      </div>
    </Layout>
  );
}

export default App;
