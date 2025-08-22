/**
 * ! 文件由脚本生成，不要直接修改
 */
import defineAPI from './defineAPI'

const apiMap = {
  /** 用户勋章 */
  'POST /user-medal/page': defineAPI<
    APIDao.WebEndpointsUserMedalUserMedalPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfUserMedalPageVo
  >('/user-medal/page', 'POST'),
  /** 节点用户列表 */
  'POST /user/node-user-list': defineAPI<
    null,
    Array<APIDao.WebEndpointsUserNodeUserVo>
  >('/user/node-user-list', 'POST'),
  /** 重置用户密码 */
  'POST /user/reset-password': defineAPI<
    APIDao.WebEndpointsUserResetPasswordReq,
    boolean
  >('/user/reset-password', 'POST'),
  /** 删除用户 */
  'POST /user/delete': defineAPI<APIDao.WebEndpointsUserUserDeleteReq, boolean>(
    '/user/delete',
    'POST',
  ),
  /** C端-获取当前登录用户的详细信息 */
  'POST /user/login-user-detail': defineAPI<
    null,
    APIDao.WebEndpointsUserUserDetailVo
  >('/user/login-user-detail', 'POST'),
  /** 编辑个人资料 */
  'POST /user/edit-profile': defineAPI<
    APIDao.WebEndpointsUserUserEditProfileReq,
    boolean
  >('/user/edit-profile', 'POST'),
  /** 用户登录 */
  'POST /user/login': defineAPI<
    APIDao.WebEndpointsUserUserLoginReq,
    APIDao.WebEndpointsUserLoginTokenVo
  >('/user/login', 'POST'),
  /** 修改邮箱地址 */
  'POST /user/modify-email-address': defineAPI<
    APIDao.WebEndpointsUserUserModifyEmailAddressReq,
    boolean
  >('/user/modify-email-address', 'POST'),
  /** 修改手机号 */
  'POST /user/modify-phone': defineAPI<
    APIDao.WebEndpointsUserUserModifyPhoneReq,
    boolean
  >('/user/modify-phone', 'POST'),
  /** 用户预注册, 返回一个用户 Id, 使用该 id 完成后续注册流程 */
  'POST /user/pre-register': defineAPI<
    APIDao.WebEndpointsUserPreRegisterReq,
    string
  >('/user/pre-register', 'POST'),
  /** 用户注册 */
  'POST /user/register': defineAPI<
    APIDao.WebEndpointsUserRegisterReq,
    APIDao.WebEndpointsUserRegisterTokenVo
  >('/user/register', 'POST'),
  /** 发送短信 */
  'POST /sms/send': defineAPI<APIDao.WebEndpointsSmsSendSmsRequest, boolean>(
    '/sms/send',
    'POST',
  ),
  /** 校验短信验证码 */
  'POST /sms/verify': defineAPI<
    APIDao.WebEndpointsSmsVerifySmsRequest,
    boolean
  >('/sms/verify', 'POST'),
  /** 打赏稻米 */
  'POST /score/reward': defineAPI<
    APIDao.WebEndpointsScoreRewardScoreReq,
    boolean
  >('/score/reward', 'POST'),
  /** 发送稻米 */
  'POST /score/send': defineAPI<APIDao.WebEndpointsScoreSendScoreReq, boolean>(
    '/score/send',
    'POST',
  ),
  /** 用户稻米明细 */
  'POST /score/user-sore-record-page': defineAPI<
    APIDao.WebEndpointsScoreUserScoreRecordPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfUserScoreRecordPageVo
  >('/score/user-sore-record-page', 'POST'),
  /** 创建提案 */
  'POST /proposal/create': defineAPI<
    APIDao.WebEndpointsProposalCreateProposalReq,
    string
  >('/proposal/create', 'POST'),
  /** 删除我的提案 */
  'POST /proposal/delete-my-proposal': defineAPI<
    APIDao.WebEndpointsProposalDeleteMyProposalReq,
    boolean
  >('/proposal/delete-my-proposal', 'POST'),
  /** 我的投票选择 */
  'POST /proposal/my-proposal-choice': defineAPI<
    APIDao.WebEndpointsProposalMyProposalChoiceReq,
    APIDao.WebEndpointsProposalMyProposalChoiceVo
  >('/proposal/my-proposal-choice', 'POST'),
  /** 我的提案列表 */
  'POST /proposal/my-proposal-list': defineAPI<
    APIDao.WebEndpointsProposalMyProposalReq,
    Array<APIDao.WebEndpointsProposalMyProposalVo>
  >('/proposal/my-proposal-list', 'POST'),
  /** 提案详情 */
  'POST /proposal/detail': defineAPI<
    APIDao.WebEndpointsProposalProposalDetailReq,
    APIDao.WebEndpointsProposalProposalDetailVo
  >('/proposal/detail', 'POST'),
  /** 提案列表 */
  'POST /proposal/page': defineAPI<
    APIDao.WebEndpointsProposalProposalPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfProposalPageVo
  >('/proposal/page', 'POST'),
  /** 投票提案 */
  'POST /proposal/vote': defineAPI<
    APIDao.WebEndpointsProposalVoteProposalReq,
    boolean
  >('/proposal/vote', 'POST'),
  /** 节点列表 */
  'POST /node/list': defineAPI<null, Array<APIDao.WebEndpointsNodeNodeListVo>>(
    '/node/list',
    'POST',
  ),
  /** 公告详情 */
  'POST /information/detail': defineAPI<
    APIDao.WebEndpointsInformationInformationDetailReq,
    APIDao.WebEndpointsInformationInformationDetailVo
  >('/information/detail', 'POST'),
  /** 公告分页查询 */
  'POST /information/page': defineAPI<
    APIDao.WebEndpointsInformationInformationPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfInformationPageVo
  >('/information/page', 'POST'),
  /** 基金会信息查询 */
  'POST /global-config/foundation-info': defineAPI<
    null,
    APIDao.WebEndpointsGlobalConfigFoundationInfoVo
  >('/global-config/foundation-info', 'POST'),
  /** 下载文件 */
  'GET /file/download': defineAPI<
    {
      fileId: string
      fileType: APIDao.DomainEnumsFileType
      autoDownload: boolean
    },
    Blob
  >('/file/download', 'GET'),
  /** 上传文件 */
  'POST /file/upload': defineAPI<
    APIDao.WebEndpointsFileFileUploadForm,
    APIDao.WebApplicationVoFileUploadSuccessVo
  >('/file/upload', 'POST', {divider: {formData: ['file', 'fileType']}}),
  /** 发送邮件 */
  'POST /email/send': defineAPI<
    APIDao.WebEndpointsEmailSendEmailRequest,
    boolean
  >('/email/send', 'POST'),
  /** 查询banner列表 */
  'POST /banner/list': defineAPI<null, Array<APIDao.WebApplicationVoBannerVo>>(
    '/banner/list',
    'POST',
  ),
}
export default apiMap
export type APIMap = typeof apiMap
export type APIPaths = keyof APIMap
