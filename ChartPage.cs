using System;
using Xamarin.Forms;

namespace ChartPerformance
{
    public class ChartPage : ContentPage
    {
        public ChartPage(String title)
        {

            Title = title;
            Content = new WebView {
                Source = new UrlWebViewSource
                {
                    Url = "http://blog.xamarin.com/",
                },
                VerticalOptions = LayoutOptions.FillAndExpand
            };

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

