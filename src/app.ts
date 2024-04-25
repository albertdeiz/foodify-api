import 'module-alias/register';
import express from "express";
import routesV1 from "./routes/v1";

const app = express();

app.use(express.json());

app.use('/api/v1', routesV1);

// Puerto de escucha
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
