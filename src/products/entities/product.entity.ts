import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{unique: true})
    title: string;

    @Column('numeric', {})
    price: number;

    @Column('text', {nullable: true})
    description: string;

    @Column('text',{unique: true, nullable: true})
    slug: string;
    
    @Column('int', {nullable: true})
    stock: number;

    @Column('text', {array: true})
    sizes: string[];

    @Column('text')
    gender: string;

    @BeforeInsert()
    checkSlugInsert() { //Verifica que lo que va a ser insertado se esta insertando correctamente
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", ""); 
    }
}
