from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import joblib

# .pklファイルからモデルを読み込む
kmeans = joblib.load('clustering/python/output/kmeans_model.pkl')
# モデルをONNX形式に変換
initial_type = [('float_input', FloatTensorType([None, 24]))]
onnx_model = convert_sklearn(kmeans, initial_types=initial_type)

# ONNXモデルをファイルに保存
with open("clustering/python/output/kmeans_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
