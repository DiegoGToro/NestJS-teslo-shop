import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}
  
  async create(createProductDto: CreateProductDto) {
    try {      
      /* if(!createProductDto.slug) {
        createProductDto.slug = createProductDto.title.toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll("'", "");
      }else{
        createProductDto.slug = createProductDto.slug.toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll("'", "");
      } */

      const product = this.productRepository.create(createProductDto);//esto crea una nueva instancia de producto a partir del DTO
      await this.productRepository.save(product); //Esto guarda el producto en la base de datos
      
      return product;
    
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDBErrors(error:any) {
    if (error.code === '23505') {
        throw new BadRequestException("Ya existe un producto con ese nombre");
        //this.logger.error(`Failed to create product. Data: `, error);
    }
    throw new InternalServerErrorException('¡AYUDA!');
  }
}