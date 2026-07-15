import mongoose from "mongoose";

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI ortam değişkeni tanımlanmamış.");
  }

  await mongoose.connect(mongoUri);

  console.log(
    `MongoDB bağlantısı başarılı: ${mongoose.connection.host}`
  );
};

export default connectDatabase;