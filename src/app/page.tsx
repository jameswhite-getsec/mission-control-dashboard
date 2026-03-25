import Layout from '../components/Layout'
export default function Page(){
  return (
    <Layout>
      <div className="grid grid-cols-3 gap-4">
        {['To do','In progress','Done'].map((col)=> (
          <section key={col} className="bg-white rounded border border-slate-200 p-4">
            <h2 className="font-semibold mb-3">{col}</h2>
            <ul className="space-y-3">
              <li className="p-3 border rounded hover:bg-slate-50">Sample task — {col}</li>
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  )
}
