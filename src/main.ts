import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); //Establece un prefijo global para todas las rutas de la aplicación. En este caso, todas las rutas estarán bajo el prefijo 'api/v1'. Por ejemplo, si tienes una ruta '/products', se accederá a ella a través de '/api/v1/products'.
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
      
    })
  ); //Habilita la validación global de las solicitudes entrantes. El objeto ValidationPipe se utiliza para validar los datos de entrada según las reglas definidas en los DTOs (Data Transfer Objects). La opción whitelist: true permite eliminar cualquier propiedad que no esté definida en el DTO, lo que ayuda a prevenir la inyección de datos no deseados.
   //Establece un prefijo global para todas las rutas de la aplicación. En este caso, todas las rutas estarán bajo el prefijo 'api/v1'. Por ejemplo, si tienes una ruta '/products', se accederá a ella a través de '/api/v1/products'.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

//Entity
//Controlador
//Servicio
//Módulo
//Decorador
//Inyección de dependencias
//Repository pattern
//DTOs (Data Transfer Objects) para validar los datos de entrada
//Manejo de errores con excepciones