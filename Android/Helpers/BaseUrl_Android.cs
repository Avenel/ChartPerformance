using System;
using Xamarin.Forms;
using ChartPerformance.Android;

[assembly: Dependency (typeof (BaseUrl_Android))]
namespace ChartPerformance.Android 
{
    public class BaseUrl_Android : IBaseUrl 
    {
        public string Get () 
        {
            return "file:///android_asset/";
        }
    }
}