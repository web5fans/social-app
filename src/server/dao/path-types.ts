/**
 * ! 文件由脚本生成，不要直接修改
 */
/** */
export type APITypeTuple = {
  'POST /user-medal/page': [
    APIDao.WebEndpointsUserMedalUserMedalPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfUserMedalPageVo,
  ]
  'POST /user/node-user-list': [null, Array<APIDao.WebEndpointsUserNodeUserVo>]
  'POST /user/reset-password': [
    APIDao.WebEndpointsUserResetPasswordReq,
    boolean,
  ]
  'POST /user/delete': [APIDao.WebEndpointsUserUserDeleteReq, boolean]
  'POST /user/login-user-detail': [null, APIDao.WebEndpointsUserUserDetailVo]
  'POST /user/edit-profile': [
    APIDao.WebEndpointsUserUserEditProfileReq,
    boolean,
  ]
  'POST /user/login': [
    APIDao.WebEndpointsUserUserLoginReq,
    APIDao.WebEndpointsUserLoginTokenVo,
  ]
  'POST /user/modify-email-address': [
    APIDao.WebEndpointsUserUserModifyEmailAddressReq,
    boolean,
  ]
  'POST /user/modify-phone': [
    APIDao.WebEndpointsUserUserModifyPhoneReq,
    boolean,
  ]
  'POST /user/pre-register': [APIDao.WebEndpointsUserPreRegisterReq, string]
  'POST /user/register': [
    APIDao.WebEndpointsUserRegisterReq,
    APIDao.WebEndpointsUserRegisterTokenVo,
  ]
  'POST /sms/send': [APIDao.WebEndpointsSmsSendSmsRequest, boolean]
  'POST /sms/verify': [APIDao.WebEndpointsSmsVerifySmsRequest, boolean]
  'POST /score/reward': [APIDao.WebEndpointsScoreRewardScoreReq, boolean]
  'POST /score/send': [APIDao.WebEndpointsScoreSendScoreReq, boolean]
  'POST /score/user-sore-record-page': [
    APIDao.WebEndpointsScoreUserScoreRecordPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfUserScoreRecordPageVo,
  ]
  'POST /proposal/create': [
    APIDao.WebEndpointsProposalCreateProposalReq,
    string,
  ]
  'POST /proposal/delete-my-proposal': [
    APIDao.WebEndpointsProposalDeleteMyProposalReq,
    boolean,
  ]
  'POST /proposal/my-proposal-choice': [
    APIDao.WebEndpointsProposalMyProposalChoiceReq,
    APIDao.WebEndpointsProposalMyProposalChoiceVo,
  ]
  'POST /proposal/my-proposal-list': [
    APIDao.WebEndpointsProposalMyProposalReq,
    Array<APIDao.WebEndpointsProposalMyProposalVo>,
  ]
  'POST /proposal/detail': [
    APIDao.WebEndpointsProposalProposalDetailReq,
    APIDao.WebEndpointsProposalProposalDetailVo,
  ]
  'POST /proposal/page': [
    APIDao.WebEndpointsProposalProposalPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfProposalPageVo,
  ]
  'POST /proposal/vote': [APIDao.WebEndpointsProposalVoteProposalReq, boolean]
  'POST /node/list': [null, Array<APIDao.WebEndpointsNodeNodeListVo>]
  'POST /information/detail': [
    APIDao.WebEndpointsInformationInformationDetailReq,
    APIDao.WebEndpointsInformationInformationDetailVo,
  ]
  'POST /information/page': [
    APIDao.WebEndpointsInformationInformationPageReq,
    APIDao.NetCorePalExtensionsDtoPagedDataOfInformationPageVo,
  ]
  'POST /global-config/foundation-info': [
    null,
    APIDao.WebEndpointsGlobalConfigFoundationInfoVo,
  ]
  'GET /file/download': [
    {
      fileId: string
      fileType: APIDao.DomainEnumsFileType
      autoDownload: boolean
    },
    Blob,
  ]
  'POST /file/upload': [
    APIDao.WebEndpointsFileFileUploadForm,
    APIDao.WebApplicationVoFileUploadSuccessVo,
  ]
  'POST /email/send': [APIDao.WebEndpointsEmailSendEmailRequest, boolean]
  'POST /banner/list': [null, Array<APIDao.WebApplicationVoBannerVo>]
}
