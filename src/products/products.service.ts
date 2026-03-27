import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { map } from 'rxjs';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>
  ){}
  
  /* Esta función crea un producto y sus imágenes asociadas en dos pasos separados, lo cual es más claro y manejable, especialmente cuando se trata de relaciones complejas. Además, maneja los errores de manera adecuada, asegurando que cualquier problema durante la creación del producto o las imágenes sea registrado y comunicado correctamente.
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // 1. Crear y guardar el producto primero
      const product = this.productRepository.create(productDetails);
      await this.productRepository.save(product);

      // 2. Crear las imágenes asociadas
      const productImages = images.map(url =>
        this.productImageRepository.create({
          url,
          product,
        }),
      );

      // 3. Guardar las imágenes
      await this.productImageRepository.save(productImages);

      // 4. Retornar el producto con imágenes
      return {
        ...product,
        images: productImages,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }*/

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...createProductDto,
        images: images.map(image => this.productImageRepository.create({url: image})) //Esto mapea cada URL de imagen a una nueva entidad ProductImage, que luego se asocia con el producto principal a través de la relación definida en la entidad Product.
      });//esto crea una nueva instancia de producto a partir del DTO
      
      await this.productRepository.save(product); //Esto guarda el producto en la base de datos
      
      return { product, images };
    
    } catch (error) {
      this.handleDBErrors(error);
    }
  }


  findAll(paginationDto: PaginationDto) {//La paginación se maneja a través de los parámetros limit y offset, que se extraen del objeto paginationDto. El método findAll utiliza el repositorio de productos para recuperar los productos de la base de datos, aplicando la paginación mediante las opciones take y skip.
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      //product = await this.productRepository.findOneBy({slug: term});
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder.where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne();
    }
    //const product = this.productRepository.findOneBy({id});
    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }
    return product;
  }

  //Esta función funciona correctamente, es necesario ir a las relaciones y agregar una importanción @Exclude para que la información no se serialice y dentro de imagen aparezca la información de Producto
  /* Esta función elimina la cascada, lo cual es mejor para proyectos grandes, pero requiere más código para manejar las imágenes de manera separada
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      //Buscar el Producto, si no existe lanzar un error
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
        images: updateProductDto.images?.map(image => this.productImageRepository.create({url: image})) //Esto mapea cada URL de imagen a una nueva entidad ProductImage, que luego se asocia con el producto principal a través de la relación definida en la entidad Product.
      });
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      //Guardar cambios basicos del Producto actualizado
      await this.productRepository.save(product);
      //Manejar las imágenes, si se enviaron en el DTO
      if (updateProductDto.images) {
        //Eliminar las imágenes existentes del producto
        await this.productImageRepository.delete({ product: { id } });
        //Crear nuevas entidades de imagen y asociarlas al producto
        const newImages = updateProductDto.images.map(url =>
          this.productImageRepository.create({
            url,
            product,
          }),
        );
        //Guardar las nuevas imágenes en la base de datos
        await this.productImageRepository.save(newImages);
        product.images = newImages; //Actualizar la propiedad images del producto con las nuevas imágenes asociadas
      }
      //retornar el producto actualizado con las nuevas imágenes
      return await this.productRepository.findOne({
        where: { id },
        relations: {
          images: true,
        },
      });
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  */

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
      images: updateProductDto.images?.map(image => this.productImageRepository.create({url: image})) //Esto mapea cada URL de imagen a una nueva entidad ProductImage, que luego se asocia con el producto principal a través de la relación definida en la entidad Product.
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({id});
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    await this.productRepository.remove(product);
  }

  private handleDBErrors(error:any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
      //this.logger.error(`Failed to create product. Data: `, error);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check logs');
  }
}