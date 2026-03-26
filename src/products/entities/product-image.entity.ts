import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from './product.entity';

@Entity()
export class ProductImage{
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;
    
    @ManyToMany(
        ()=>product=>product.images
    )
    product: Product
}