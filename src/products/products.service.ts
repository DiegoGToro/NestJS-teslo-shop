import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}
  
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);//esto crea una nueva instancia de producto a partir del DTO
      await this.productRepository.save(product); //Esto guarda el producto en la base de datos
      
      return product;
    
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
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
    throw new InternalServerErrorException('¡AYUDA!');
  }
}