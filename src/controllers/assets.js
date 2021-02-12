import assetsService from '../services/assets';
import handler from '../helpers/asyncMiddleware';

const SUCCESS_STATUS = 'success';

export default {
  getAssets: handler(async (req, res) => {
    const assets = await assetsService.getAssets(req.params.address);
    res.json({
      status: SUCCESS_STATUS,
      data: assets,
    });
  }),
};
