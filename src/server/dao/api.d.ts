/**
 * ! 文件由脚本生成，不要直接修改
 */
/** */
declare namespace APIDao {
  /** POST /user-medal/page */
  interface WebEndpointsUserMedalUserMedalPageReq {
    /** 用户域名 */
    domainName: string

    /** 页码 */
    pageNum: number

    /** 分页大小 */
    pageSize: number
  }

  /** POST /user-medal/page */
  interface NetCorePalExtensionsDtoPagedDataOfUserMedalPageVo {
    items: Array<WebEndpointsUserMedalUserMedalPageVo>

    total: number

    pageIndex: number

    pageSize: number
  }

  /** POST /user/node-user-list */
  interface WebEndpointsUserNodeUserVo {
    /** 用户 Id */
    id: string

    /** DID */
    did: string
  }

  /** POST /user/reset-password */
  interface WebEndpointsUserResetPasswordReq {
    /** 邮箱 */
    email: string

    /** 手机号 */
    phone: string

    /** 如果是手机号，需要传区号 */
    phoneRegion: string

    /** 验证码 */
    verifyCode: string

    /** 重置的密码 */
    password: string

    resetPasswordType: WebEndpointsUserResetPasswordType
  }

  /** POST /user/delete */
  interface WebEndpointsUserUserDeleteReq {
    /** 邮箱 */
    email: string

    /** 手机号 */
    phone: string

    /** 如果是手机号，需要传区号 */
    phoneRegion: string

    /** 验证码 */
    verifyCode: string

    userDeleteType: WebEndpointsUserUserDeleteType
  }

  /** POST /user/login-user-detail */
  interface WebEndpointsUserUserDetailVo {
    /** 用户Id */
    id: string

    /** 邮箱 */
    email: string

    /** 手机号 */
    phone: string

    /** 手机区号 */
    phoneRegion: string

    /** 用户昵称 */
    nickName: string

    /** 完整用户名，域名 */
    domainName: string

    /** DID */
    did: string

    /** 稻米 */
    score: number

    /** 是否是节点用户 */
    nodeUser: boolean

    /** 是否禁用 */
    disable: boolean
  }

  /** POST /user/edit-profile */
  interface WebEndpointsUserUserEditProfileReq {
    /** 用户头像 */
    avatar: string

    /** 用户昵称 */
    nickName: string

    /** 简介 */
    introduction: string
  }

  /** POST /user/login */
  interface WebEndpointsUserUserLoginReq {
    /** 用户域名 */
    domainName: string

    /** 邮箱 */
    email: string

    /** 手机号 */
    phone: string

    /** 手机区号 */
    phoneRegion: string

    /** 登录密码 */
    password: string

    loginType: WebEndpointsUserLoginType
  }

  /** POST /user/login */
  interface WebEndpointsUserLoginTokenVo {
    /** 访问非 BlueSky 的接口携带该 Token */
    token: string

    /** 访问 BlueSky 的接口使用该 Token */
    blueSkyToken: string

    /** BlueSky RefreshToken */
    blueSkyRefreshToken: string
  }

  /** POST /user/modify-email-address */
  interface WebEndpointsUserUserModifyEmailAddressReq {
    /** 邮箱地址 */
    email: string

    codeType: WebUtilsCodeType

    /** 验证码 */
    code: string
  }

  /** POST /user/modify-phone */
  interface WebEndpointsUserUserModifyPhoneReq {
    /** 手机区号, 默认86 */
    phoneRegion: string

    /** 手机号 */
    phone: string

    codeType: WebUtilsCodeType

    /** 验证码 */
    code: string
  }

  /** POST /user/pre-register */
  interface WebEndpointsUserPreRegisterReq {
    registerType: WebEndpointsUserRegisterType

    /** 邮箱 */
    email: string

    /** 手机号 */
    phone: string

    /** 如果是手机号，需要传区号 */
    phoneRegion: string

    /** 验证码 */
    verifyCode: string
  }

  /** POST /user/register */
  interface WebEndpointsUserRegisterReq {
    /** 预注册获取 Guid */
    preRegisterGuid: string

    /** 密码 */
    password: string

    /** 用户生日 {"format":"date-time"} */
    birthday: string

    /** 用户域名 */
    domainName: string
  }

  /** POST /user/register */
  interface WebEndpointsUserRegisterTokenVo {
    /** 访问非 BlueSky 的接口携带该 Token */
    token: string

    /** 访问 BlueSky 的接口使用该 Token */
    blueSkyToken: string
  }

  /** POST /sms/send */
  interface WebEndpointsSmsSendSmsRequest {
    /** 手机号区号 */
    phoneRegion: string

    /** 手机号 */
    phone: string

    codeType: WebUtilsCodeType
  }

  /** POST /sms/verify */
  interface WebEndpointsSmsVerifySmsRequest {
    /** 手机号区号 */
    phoneRegion: string

    /** 手机号 */
    phone: string

    codeType: WebUtilsCodeType

    /** 验证码 */
    code: string
  }

  /** POST /score/reward */
  interface WebEndpointsScoreRewardScoreReq {
    /** 接收用户的Did */
    toUserDid: string

    /** 稻米 */
    score: number

    /** 扩展信息（帖子的标题等相关信息） */
    extendInfo: string
  }

  /** POST /score/send */
  interface WebEndpointsScoreSendScoreReq {
    /** 接收用户的手机号或邮箱 */
    userPhoneOrEmail: string

    /** 稻米 */
    score: number
  }

  /** POST /score/user-sore-record-page */
  interface WebEndpointsScoreUserScoreRecordPageReq {
    /** 页码 */
    pageNum: number

    /** 分页大小 */
    pageSize: number
  }

  /** POST /score/user-sore-record-page */
  interface NetCorePalExtensionsDtoPagedDataOfUserScoreRecordPageVo {
    items: Array<WebEndpointsScoreUserScoreRecordPageVo>

    total: number

    pageIndex: number

    pageSize: number
  }

  /** POST /proposal/create */
  interface WebEndpointsProposalCreateProposalReq {
    /** 提案名称 */
    name: string

    /** 投票截至时间 {"format":"date-time"} */
    endAt: string

    /** 附件 Id */
    attachId: string
  }

  /** POST /proposal/delete-my-proposal */
  interface WebEndpointsProposalDeleteMyProposalReq {
    /** 提案 Id */
    proposalId: string
  }

  /** POST /proposal/my-proposal-choice */
  interface WebEndpointsProposalMyProposalChoiceReq {
    /** 提案 Id */
    proposalId: string
  }

  /** POST /proposal/my-proposal-choice */
  interface WebEndpointsProposalMyProposalChoiceVo {
    choice: DomainEnumsVoteType
  }

  /** POST /proposal/my-proposal-list */
  interface WebEndpointsProposalMyProposalReq {
    /** 类型 0-全部，1-我发布的，2-我参与的 */
    type: number
  }

  /** POST /proposal/my-proposal-list */
  interface WebEndpointsProposalMyProposalVo {
    /** 提案 Id */
    proposalId: string

    /** 提案名称 */
    name: string

    /** 发起方名称 */
    initiatorId: string

    /** 发起方名称 */
    initiatorName: string

    /** 发起方邮箱 */
    initiatorEmail: string

    /** 发起方头像 */
    initiatorAvatar: string

    /** 反对票数 */
    opposeVotes: number

    /** 同意票数 */
    agreeVotes: number

    status: DomainEnumsProposalStatus

    /** 创建时间 {"format":"date-time"} */
    createdAt: string

    /** 发起方 Did */
    initiatorDid: string

    /** 发起方域名 */
    initiatorDomainName: string

    choice: DomainEnumsVoteType
  }

  /** POST /proposal/detail */
  interface WebEndpointsProposalProposalDetailReq {
    /** 提案 Id */
    proposalId: string
  }

  /** POST /proposal/detail */
  interface WebEndpointsProposalProposalDetailVo {
    /** 提案 Id */
    proposalId: string

    /** 提案名称 */
    name: string

    /** 发起方名称 */
    initiatorId: string

    /** 发起方 Did */
    initiatorDid: string

    /** 发起方域名 */
    initiatorDomainName: string

    /** 发起方名称 */
    initiatorName: string

    /** 发起方邮箱 */
    initiatorEmail: string

    /** 发起方头像 */
    initiatorAvatar: string

    /** 投票截至时间 {"format":"date-time"} */
    endAt: string

    /** 附件 Id */
    attachId: string

    /** 总投票数 */
    totalVotes: number

    /** 反对票数 */
    opposeVotes: number

    /** 同意票数 */
    agreeVotes: number

    status: DomainEnumsProposalStatus

    /** 创建时间 {"format":"date-time"} */
    createdAt: string
  }

  /** POST /proposal/page */
  interface WebEndpointsProposalProposalPageReq {
    /** 页码 */
    pageNum: number

    /** 分页大小 */
    pageSize: number

    status: DomainEnumsProposalStatus

    /** 查询用户的 Did，当前登陆用户 Did */
    did: string
  }

  /** POST /proposal/page */
  interface NetCorePalExtensionsDtoPagedDataOfProposalPageVo {
    items: Array<WebEndpointsProposalProposalPageVo>

    total: number

    pageIndex: number

    pageSize: number
  }

  /** POST /proposal/vote */
  interface WebEndpointsProposalVoteProposalReq {
    /** 提案 Id */
    proposalId: string

    choose: DomainEnumsVoteType
  }

  /** POST /node/list */
  interface WebEndpointsNodeNodeListVo {
    /** 节点 Id */
    nodeId: string

    /** 节点用户 Id */
    userId: string

    /** 节点用户 Did */
    userDid: string

    /** 节点 Logo */
    logo: string

    /** 节点名称 */
    name: string

    /** 节点描述 */
    description: string

    /** 稻米数量 */
    score: number
  }

  /** POST /information/detail */
  interface WebEndpointsInformationInformationDetailReq {
    /** 公告 Id */
    informationId: string
  }

  /** POST /information/detail */
  interface WebEndpointsInformationInformationDetailVo {
    /** 公告 Id */
    informationId: string

    /** 公告标题 */
    name: string

    /** 公告附件 Id */
    attachId: string

    /** 创建时间 {"format":"date-time"} */
    createAt: string
  }

  /** POST /information/page */
  interface WebEndpointsInformationInformationPageReq {
    /** 页码 */
    pageNum: number

    /** 页大小 */
    pageSize: number
  }

  /** POST /information/page */
  interface NetCorePalExtensionsDtoPagedDataOfInformationPageVo {
    items: Array<WebEndpointsInformationInformationPageVo>

    total: number

    pageIndex: number

    pageSize: number
  }

  /** POST /global-config/foundation-info */
  interface WebEndpointsGlobalConfigFoundationInfoVo {
    /** 基金规模 */
    fundScale: number

    /** 发行稻米规模 */
    issuePointsScale: number

    /** 基金会公开信息文件 */
    foundationPublicDocument: Array<string>
  }

  /** 文件类型枚举 1-图片 2-文件 {"x-enumNames":["Picture","File"]} */
  type DomainEnumsFileType = 1 | 2

  /** POST /file/upload */
  interface WebEndpointsFileFileUploadForm {
    /** 文件 {"format":"binary"} */
    file: Blob

    fileType: DomainEnumsFileType
  }

  /** POST /file/upload */
  interface WebApplicationVoFileUploadSuccessVo {
    /** 文件 Id */
    fileId: string
  }

  /** POST /email/send */
  interface WebEndpointsEmailSendEmailRequest {
    /** 名称 */
    name: string

    /** 邮箱账号 */
    email: string

    codeType: WebUtilsCodeType
  }

  /** POST /banner/list */
  interface WebApplicationVoBannerVo {
    /** BannerId */
    id: string

    /** Banner 文件 Id */
    bannerFileId: string

    /** 链接地址 */
    linkAddress: string
  }

  interface WebEndpointsUserMedalUserMedalPageVo {
    /** 勋章 Id */
    medalId: string

    /** 封面 Id */
    attachId: string

    /** 勋章名称 */
    name: string

    /** 获得时间 {"format":"date-time"} */
    getTime?: string
  }

  /** 重置密码验证类型类型 {"x-enumNames":["Unknown","Email","Phone"]} */
  type WebEndpointsUserResetPasswordType = 0 | 1 | 2

  /** 删除账户验证类型 {"x-enumNames":["Unknown","Email","Phone"]} */
  type WebEndpointsUserUserDeleteType = 0 | 1 | 2

  /** 登录类型 {"x-enumNames":["Unknown","DomainName","Email","Phone"]} */
  type WebEndpointsUserLoginType = 0 | 1 | 2 | 3

  /** 验证码类型 0-未知 1-登录 2-重置密码 3-注册 4-修改邮箱 5-更换手机号 6-后台用户登录 7-后台用户重置密码 8-后台稻米发放 9-注销账户 {"x-enumNames":["Unknown","Login","ResetPassword","Register","ChangeEmail","ChangePhone","AdminUserLogin","AdminUserResetPassword","AdminUserScoreDistribution","DeleteAccount"]} */
  type WebUtilsCodeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

  /** {"x-enumNames":["Unknown","Email","Phone"]} */
  type WebEndpointsUserRegisterType = 0 | 1 | 2

  interface WebEndpointsScoreUserScoreRecordPageVo {
    /** 稻米明细主键Id */
    id: string

    type: DomainEnumsScoreSourceType

    /** 获得原因 */
    reason: string

    /** 稻米数量 */
    score: number

    /** 创建时间 {"format":"date-time"} */
    createdAt: string
  }

  /** 投票选项 {"x-enumNames":["Unknown","Agree","Oppose"]} */
  type DomainEnumsVoteType = 0 | 1 | 2

  /** 提案状态 {"x-enumNames":["Unknown","Review","Pass","Oppose"]} */
  type DomainEnumsProposalStatus = 0 | 1 | 2 | 3

  interface WebEndpointsProposalProposalPageVo {
    /** 提案 Id */
    proposalId: string

    /** 提案名称 */
    name: string

    /** 发起方名称 */
    initiatorId: string

    /** 发起方 Did */
    initiatorDid: string

    /** 发起方域名 */
    initiatorDomainName: string

    /** 发起方名称 */
    initiatorName: string

    /** 发起方邮箱 */
    initiatorEmail: string

    /** 发起方头像 */
    initiatorAvatar: string

    /** 反对票数 */
    opposeVotes: number

    /** 同意票数 */
    agreeVotes: number

    status: DomainEnumsProposalStatus

    /** 创建时间 {"format":"date-time"} */
    createdAt: string

    choice: DomainEnumsVoteType
  }

  interface WebEndpointsInformationInformationPageVo {
    /** 公告 Id */
    id: string

    /** 公告名称 */
    name: string

    /** 附件 Id */
    attachId: string

    /** 创建时间 {"format":"date-time"} */
    createAt: string
  }

  /** 稻米来源类型 0-未知 1-打赏 2-赠送 3-后台发放 {"x-enumNames":["Unknown","Reward","Send","AdminDistribution"]} */
  type DomainEnumsScoreSourceType = 0 | 1 | 2 | 3
}
