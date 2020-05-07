// import { Client } from "socket-chat-protocol";
// import { Socket } from "../sockets/socket";
// import { SocketManager } from "../sockets/socketManager";
// import { Usermanager } from "../user/usermanager";

// /**
//  * Interface representing the return value of the Credentials Check.
//  */
// export interface LoginObject {
//     success: boolean;
//     id?: string;
// }

// /**
//  * Class for managing user-authentication.
//  */
// export class AuthenticationManager {
//     private socketManager!: SocketManager;
//     private userManager!: Usermanager;

//     public start(socketManager: SocketManager, userManager: Usermanager): void {
//         this.socketManager = socketManager;
//         this.userManager = userManager;
//     }

//     /**
//      * Process the login request of a socket.
//      * @param socket socket to login
//      * @param request request to process
//      */
//     public async login(socket: Socket, request: Client.LoginRequest): Promise<void> {
//         if (socket.user) {
//             this.socketManager.emit(socket, "server/login-response", [
//                 {
//                     username: request.username,
//                     success: true,
//                     id: socket.user.id
//                 }
//             ]);
//             return;
//         }

//         // Check, if the given requests includes valid credentials
//         const credentialCheck = await this.checkCredentials(request);
//         if (credentialCheck.success && credentialCheck.id) {
//             const user = this.userManager.getUser(request.username.toLocaleLowerCase());
//             if (!user) {
//                 this.socketManager.emit(socket, "error/internal-error", [
//                     {
//                         request: "server/login-request" as any,
//                         type: "internal error" as any,
//                         code: 500 as any,
//                         message: "An internal error happend during login process."
//                     }
//                 ]);
//                 return;
//             }

//             socket.user = user;
//             this.socketManager.addExtendedEventsToSocket(socket);
//             this.socketManager.emit(socket, "server/login-response", [
//                 {
//                     username: request.username,
//                     id: credentialCheck.id,
//                     success: true
//                 }
//             ]);
//         } else {
//             this.socketManager.emit(socket, "server/login-response", [
//                 {
//                     username: request.username,
//                     id: "-1",
//                     success: false
//                 }
//             ]);
//         }
//     }

//     /**
//      * Check the credentials provided.
//      */
//     private async checkCredentials({ username, password }: Client.LoginRequest): Promise<LoginObject> {
//         // TODO: Add real authentication
//         if (!username || !password) {
//             return {
//                 success: false
//             };
//         }

//         return {
//             success: true,
//             id: "1"
//         };
//     }
// }
