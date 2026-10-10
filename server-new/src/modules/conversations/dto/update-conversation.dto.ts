import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateConversationDto } from "./create-conversation.dto.js";




export class UpdateConversationDto extends PartialType(  OmitType(CreateConversationDto,['turns']as const) ){
 
} 