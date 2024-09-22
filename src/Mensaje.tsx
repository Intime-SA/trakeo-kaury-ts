export default function Mensaje() {
  return (
    <>
      <main
        className="grid min-h-screen w-full place-items-center bg-cover bg-center"
        style={{
          backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/AlimentosNaturales_site%20(2).png?alt=media&token=cb1df8b4-2eef-4fc2-b79f-08e045adf387')`,
        }}
      >
        <div className="bg-white bg-opacity-0 px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                alt="Your Company"
                src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/LogoAlimentosNaturales.png?alt=media&token=45601fed-80f7-41fb-9bdb-803017d341bc"
              />
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Catalogo enviado con exito{" "}
              <span
                style={{ fontSize: "2rem", marginLeft: "1rem" }}
                className="material-symbols-outlined"
              >
                mark_email_read
              </span>
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Muchas gracias por comunicarte con nosotros
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                style={{ display: "flex", justifyContent: "center" }}
                href="https://alimentosnaturales.com.ar/catalogo-online"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <h6 style={{ marginTop: "0.2rem" }}>Catalogo Online </h6>
                <span
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0rem",
                    marginLeft: "0.5rem",
                  }}
                  className="material-symbols-outlined"
                >
                  menu_book
                </span>
              </a>
              <a
                className="flex items-center text-sm font-semibold text-gray-900 hover:text-blue-600"
                href="https://api.whatsapp.com/send/?phone=542236800402&text=Hola%2C+quiero+mas+info+de+Alimentos+Naturales&type=phone_number&app_absent=0"
              >
                <h6>Contacto </h6>
                <span
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0.4rem",
                    marginLeft: "0.5rem",
                  }}
                  className="material-symbols-outlined"
                >
                  call
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
