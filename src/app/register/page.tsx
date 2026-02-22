import RegisterProducerForm from "@/components/forms/RegisterProducerForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        {/* Logo Textuel Simple */}
        <h2 className="text-3xl font-extrabold text-gray-900">
          <span className="text-[#FF8200]">Agri</span>-
          <span className="text-[#009A44]">Lien</span> CI
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enrôlement des producteurs de Cacao
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterProducerForm />
      </div>
    </div>
  );
}
