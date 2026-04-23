
export const fileFilter = (req: Express.Request, file: Express.Multer.File, calback: Function) => {

    console.log({file}),
    calback(null, true)
}