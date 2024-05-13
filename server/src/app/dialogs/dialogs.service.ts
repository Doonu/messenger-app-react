import { Injectable } from '@nestjs/common';
import {Dialog} from "./dialogs.model";
import {InjectModel} from "@nestjs/sequelize";
import {User} from "../users/models/users.model";
import {Op} from "sequelize";
import {UserDialog} from "./user-dialogs.model";
import {Message} from "../messages/models/messages.model";
import {Role} from "../roles/roles.model";
import {MessageReadStatus} from "../messages/models/messagesReadStatus.model";
import {MessagesService} from "../messages/messages.service";

@Injectable()
export class DialogsService {
    constructor(
        @InjectModel(Dialog) private dialogRepository: typeof Dialog,
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(UserDialog) private userDialogRepository: typeof UserDialog,
        @InjectModel(Message) private messageRepository: typeof Message,
        @InjectModel(MessageReadStatus) private messageReadStatus: typeof MessageReadStatus,
        private messagesService: MessagesService
    ){
    }

    async getAll(userId: number, page: number){
        let currentPage = page - 1;
        const limit = 20;

        const dialogs = await this.userDialogRepository.findAll({
            where: { userId },
            include: {all: true},
            limit: limit,
            offset: currentPage * limit
        })

        const dialogsId = dialogs.map(dialog => dialog.dialogId)

        const resultDialogs = await this.dialogRepository.findAll({
            where: {
                id: {
                    [Op.in]: dialogsId
                }
            },
            include: [
                {
                    association: 'participants',
                },
                {
                    association: 'lastMessage',
                    include: ['author'],
                },
            ],
            order: [['updatedAt', "DESC"]]
        })

        return Promise.all(resultDialogs.map(async dialog => {
            const count = await this.messageReadStatus.findAll({where: {userId, readStatus: false, dialogId: dialog.id}})

            return {
                ...JSON.parse(JSON.stringify(dialog)),
                countNotReadMessages: count.length,
                readStatusLastMessage: count.length <= 0,
            }
        }))
    }

    async getById(id: number, userId: number){
        return await this.dialogRepository.findOne(
            {
                where: { id: id },
                include: [
                    {
                        model: User,
                        include: [{
                            model: Role
                        }]
                    },
                    {
                        association: 'fixedMessage',
                        include: ['author']
                    }
                ]
            }
        )
    }

    async getByIdAndCount(id: number, userId: number){
        const findDialog = await this.dialogRepository.findOne(
            {
                where: { id: id },
                include: [
                    {
                        model: User,
                        include: [{
                            model: Role
                        }]
                    },
                    {
                        association: 'fixedMessage',
                        include: ['author']
                    }
                ]
            }
        )

        const count = await this.messageReadStatus.findAll({where: {userId: userId, readStatus: false, dialogId: findDialog.id}})

        return {
            ...JSON.parse(JSON.stringify(findDialog)),
            countNotReadMessages: count.length
        }
    }

    async deleteUserInDialog(id: number, participant: number){
        const findDialog = await this.dialogRepository.findOne(
            {
                where: { id: id },
                include: [
                    {
                        model: User,
                        include: [{
                            model: Role
                        }]
                    }
                ]
            }
        );
        const filterParticipants = findDialog.participants.filter(user => user.id !== +participant);
        const user = await this.userRepository.findOne({where: {id: participant}})
        const message = await this.messagesService.create({userId: participant, dialogId: id, content: [`${user.name} вышел из груупы`], status: 'info'});
        await this.messagesService.createMessageReadStatus({dialogId: id, userId: participant, messageId: message.id, participants: findDialog.participants});

        await findDialog.$set("participants", filterParticipants)
        findDialog.participants = filterParticipants
    }

    async create(userId: number, participantIds: number[], nameChat?: string){
        if(participantIds.length === 1){
            const linkDialogs = await this.userDialogRepository.findAll({
                where: {
                    userId: userId
                },
            })

            const dialogsId = linkDialogs.map(dialog => dialog.dialogId);

            const findAllUserDialogs = await this.dialogRepository.findAll({
                include: [
                    {
                        association: 'participants',
                    }
                ],
                where: {
                    id: {
                        [Op.in]: dialogsId
                    },
                    isGroup: false
                },
            })

           const findDialog = findAllUserDialogs.filter(dialog => {
               return !!dialog.participants.find(user => participantIds[0] === user.id);
           })

            if(findDialog.length){
                return findDialog[0];
            }
        }

        const profile = await this.userRepository.findByPk(userId)
        const users = await this.userRepository.findAll({
            where: {
                id: {
                    [Op.in]: participantIds
                }
            },
        });

        let isGroup = false;
        let nameDialog = null;
        const arrayPlayers = [profile, ...users];


        if (arrayPlayers.length  > 2 && nameChat) {
            isGroup = true
            nameDialog = nameChat
        }

        const createdDialog = await this.dialogRepository.create({dialogName: nameDialog, isGroup: isGroup});
        await createdDialog.$set("participants", arrayPlayers)
        createdDialog.participants = arrayPlayers

        return await this.dialogRepository.findOne({where: {id: createdDialog.id}, include: {all: true}})
    }

    async createFixed(dialogId: number, messageId: number){
        const dialog = await this.dialogRepository.findOne({where: {id: dialogId}});
        const findMessage = await this.messageRepository.findOne({where: {id: messageId}, include: {all: true}})
        await dialog.update({ fixedMessageId: findMessage.id })
        return findMessage;
    }

    async deleteFixed(dialogId: number){
        const dialog = await this.dialogRepository.findOne({where: {id: dialogId}});
        await dialog.update({fixedMessageId: null})
    }
}
