using System;
using Xamarin.Forms;

namespace ChartPerformance
{
    public static class App
    {
        public static MasterDetailPage MDPage { get; set; }

        public static Page GetMainPage()
        {
            MDPage = new MasterDetailPage {
                Master = new MenuPage(MDPage),
                Detail = new NavPage(CreateContentPage("Bars")),
            };
            MDPage.IsPresentedChanged += (sender, e) => Console.WriteLine(DateTime.Now + ": " + MDPage.IsPresented);
            return MDPage;
        }
            
        public static ContentPage CreateContentPage(string text)
        {
            return new ChartPage(text);
        }
    }
}