const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const config = require(`${process.cwd()}/config.json`)

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.channel.type === 'dm')return;
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === 'say') {
        const sayMessage = args.join(' ');
        message.delete().catch(O_o => {});
        message.channel.send(sayMessage);
    }
});


client.on('message', async (message) => {
    if (message.channel.type === 'dm')return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
        switch (command) {
            case `驗證`:
                try {
                    let filedata = fs.readFileSync(`${process.cwd()}/guilds/${message.guild.id}.json`);
                    let data = JSON.parse(filedata);
                    if (message.author.bot) {
                        await message.delete();
                        return;
                    }
                    if (message.channel.id != data.channel){
                        await message.delete();
                        await message.reply(`請移到 <#${data.channel}> 頻道使用驗證指令喔`);
                        return;
                    }
                    if(message.member.roles.cache.find(role => role.id  === data.roles)){
                        await message.delete();
                        await message.reply("你已經驗證過，不需要再驗證囉");
                        return;
                    }
                    if (await check(message)) {
                        try {
                            let role = message.member.guild.roles.cache.find(role => role.id === data.roles);
                            await message.guild.members.cache.get(message.author.id).roles.add(role);
                            await message.delete();
                            await message.reply(`驗證成功囉`);
                        }catch (e){
                            await message.delete();
                            await message.reply(`我沒有權限給你那麼大的身分組，請聯繫管理員重新設定:(`);
                        }
                    }
                } catch (e){
                    await message.delete();
                    await message.reply(`這個群組還沒設定完成，請聯繫管理員完成設定:(`);
                }
                break
            case `set`:
                if (message.member.hasPermission("ADMINISTRATOR")){
                    let channel = "";
                    let roles = "";
                    await message.delete();
                    await message.reply("請指定一個頻道(請於30秒內輸入完畢，並使用Tag方式完成)")
                    message.channel.awaitMessages((values) => {return values.member.user.id === message.member.user.id },{ max: 1, time: 30000, errors: ['time'] }).then((e)=>{
                        channel = e.first().mentions.channels.first().id
                        message.reply("請指定一個身分組(請於30秒內輸入完畢，並使用Tag方式完成)")
                        message.channel.awaitMessages((values) => {return values.member.user.id === message.member.user.id },{ max: 1, time: 30000, errors: ['time'] }).then((b)=>{
                            roles = b.first().mentions.roles.first().id
                            let dt = {
                                channel: channel,
                                roles: roles
                            };
                            fs.writeFileSync(`${process.cwd()}/guilds/${message.guild.id}.json`, JSON.stringify(dt));
                            message.reply("設定成功")
                        }).catch(function (e) {
                            message.reply("已結束設定，設定失敗")
                        })
                    }).catch(function (e) {
                        message.reply("已結束設定，設定失敗")
                    })
                }else {
                    await message.reply(`你沒有權限使用此指令`);
                }
                break
        }
});

async function check(message) {
    let embed = new Discord.MessageEmbed()
    embed.setTitle("通知:")
    embed.addFields(
        { name: `${message.author.tag} 請點擊一下表情確認驗證`, value: `✅做確認` }
    )
    let confirm = await message.channel.send(embed)
    await confirm.react('✅')

    let reactionFilter = (reaction, user) => (user.id === message.author.id)
    let reaction = (await confirm.awaitReactions(reactionFilter, { max: 1 })).first()

    if(await reaction.emoji.name === '✅') {
        await confirm.delete()
        return true
    }
}
client.login(config.token);