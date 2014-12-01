using System;
using Xamarin.Forms;
using ChartPerformancetester.Helpers;

namespace ChartPerformancetester
{
	public class RootPage : MasterDetailPage
	{
		public RootPage ()
		{
			// Set up the Master
			var optionsPage = new MenuPage { Icon = "settings.png", Title = "menu" };
			Master = optionsPage;	

			// Set up the Detail
			// var displayPage = new MasterPage ();
			var detailPage = new NavigationPage () {
				Tint = Helpers.Color.Blue.ToFormsColor(),
				Title = "Chart Performance"
			};
			Detail = detailPage;
		}
	}
}

