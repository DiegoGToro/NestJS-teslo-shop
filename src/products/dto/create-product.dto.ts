import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { BeforeInsert } from 'typeorm';

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    //@IsOptional() //El precio no puede ser nulo
    price: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number; 

    @IsString({ each: true })
    @IsArray()
    sizes: string[]

    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @BeforeInsert()
    checkSlugInsert() { //Verifica que lo que va a ser insertado se esta insertando correctamente
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", ""); 
    }
}
