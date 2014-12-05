using System;
using System.Reflection;
using System.IO;

using Xamarin.Forms;


namespace ChartPerformance.Pages
{
    public class ChartPage : ContentPage
    {
        public ChartPage(String title)
        {

            Title = title;

            var browser = new BaseUrlWebView () {               // temporarily use this so we can custom-render in iOS
                VerticalOptions = LayoutOptions.FillAndExpand
            }; 

            var htmlSource = new HtmlWebViewSource ();

            var assembly = typeof(ChartPage).GetTypeInfo().Assembly;
            Stream stream = assembly.GetManifestResourceStream("ChartPerformance." + title +  ".html");
            string text = "";
            using (var reader = new System.IO.StreamReader (stream)) {
                text = reader.ReadToEnd ();
            }
            htmlSource.Html = text;

            if (Device.OS != TargetPlatform.iOS) {
                // the BaseUrlWebViewRenderer does this for iOS, until bug is fixed
                var baseUrl = DependencyService.Get<IBaseUrl>();
                htmlSource.BaseUrl = baseUrl.Get();
            }
                
            browser.Source = htmlSource;

            Padding = new Thickness (10, 10, 10, 10);

            Content = browser;
        }

        private static Button Link(string name)
        {
            return new Button {
                Text = name,
                Command = new Command(o => App.MDPage.Detail.Navigation.PushAsync(App.CreateContentPage(name))),
            };
        }
    }
}

