import { Validator } from "@/http/@shared/decorators/validator.decorator";
import { Public } from "@/http/auth/decorators/public.decorator";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    CreateUserDTO,
    createUserBodySchema,
    ListUsersQueryDTO,
    listUsersQuerySchema,
    UpdateUserDTO,
    updateUserBodySchema,
    UserResponseDTO,
} from "../schemas/users.schema";
import { UsersService } from "../services/users.service";

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@Controller("/users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Post()
    @Validator(createUserBodySchema)
    @ApiOperation({ summary: "Create user", description: "Create a new user account" })
    @ApiBody({ type: CreateUserDTO })
    @ApiResponse({ status: 201, description: "User created successfully", type: UserResponseDTO })
    @ApiResponse({ status: 400, description: "Validation error" })
    @ApiResponse({ status: 409, description: "User already exists" })
    create(@Body() body: CreateUserDTO) {
        return this.usersService.create(body);
    }

    @Get()
    @Validator(listUsersQuerySchema)
    @ApiOperation({ summary: "List users", description: "Get paginated list of all users" })
    @ApiQuery({ name: "page", required: false, type: Number, description: "Page number (default: 1)" })
    @ApiQuery({ name: "limit", required: false, type: Number, description: "Items per page (default: 10, max: 100)" })
    @ApiResponse({ status: 200, description: "Users list", type: [UserResponseDTO] })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    findAll(@Query() query: ListUsersQueryDTO) {
        return this.usersService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get user by ID", description: "Get a specific user by their ID" })
    @ApiParam({ name: "id", type: String, description: "User UUID" })
    @ApiResponse({ status: 200, description: "User found", type: UserResponseDTO })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    findOne(@Param("id") id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(":id")
    @Validator(updateUserBodySchema)
    @ApiOperation({ summary: "Update user", description: "Update user information" })
    @ApiParam({ name: "id", type: String, description: "User UUID" })
    @ApiBody({ type: UpdateUserDTO })
    @ApiResponse({ status: 200, description: "User updated successfully", type: UserResponseDTO })
    @ApiResponse({ status: 400, description: "Validation error" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    @ApiResponse({ status: 409, description: "Email/username already taken" })
    update(@Param("id") id: string, @Body() body: UpdateUserDTO) {
        return this.usersService.update(id, body);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete user", description: "Delete a user account" })
    @ApiParam({ name: "id", type: String, description: "User UUID" })
    @ApiResponse({ status: 200, description: "User deleted successfully", type: UserResponseDTO })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "User not found" })
    remove(@Param("id") id: string) {
        return this.usersService.remove(id);
    }
}
