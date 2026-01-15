import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";



export class NotifyEndpoint extends OpenAPIRoute {

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        // Retrieve the validated slug
        const { value } = data.query;


        // 什么都不做，返回 success, 认证器会处理认证过程.
        return Response.json({"success": true});
    }
}