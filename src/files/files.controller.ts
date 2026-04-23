import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter
  }
  ))
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File
   ) {
    console.log(file)
    return {
      fileName: file.originalname,
    }
  }
}
