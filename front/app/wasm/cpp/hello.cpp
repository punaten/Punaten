#include <emscripten/emscripten.h>

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    float clustering(float leftHandXSpeed, float leftHandYSpeed, float rightHandXSpeed, float rightHandYSpeed, int idCount, int overHandCount)
    {
        float speedValue = leftHandXSpeed * 3 + rightHandXSpeed * 3 + leftHandYSpeed + rightHandYSpeed;
        if (idCount >= 2)
        {
            return 0;
        }
        else if ((leftHandYSpeed + rightHandYSpeed) >= 100 && (leftHandXSpeed + rightHandXSpeed) < 70)
        {
            return 1;
        }
        else if (speedValue >= 300)
        {
            return 2;
        }
        else if (overHandCount >= 10)
        {
            return 3;
        }
        return 4;
    }
}
